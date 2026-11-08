/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { storage } from './lib/storage';
import { FoodDeal, Reservation, Voucher, UserRole, Store } from './types';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Marketplace } from './components/Marketplace';
import { ReservationModal } from './components/ReservationModal';
import { VoucherModal } from './components/VoucherModal';
import { MyVouchers } from './components/MyVouchers';
import { ImpactDashboard } from './components/ImpactDashboard';
import { StoreRegisterModal } from './components/StoreRegisterModal';
import { SetupGuideModal } from './components/SetupGuideModal';
import { MerchantDashboard } from './components/merchant/MerchantDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { Footer } from './components/Footer';
import { BottomNav } from './components/BottomNav';

export default function App() {
  // Reactive Storage State
  const [, setTick] = useState(0);

  useEffect(() => {
    const unsubscribe = storage.subscribe(() => {
      setTick((t) => t + 1);
    });
    return unsubscribe;
  }, []);

  const stats = storage.getImpactStats();
  const stores = storage.getStores();
  const categories = storage.getCategories();
  const deals = storage.getAllDeals();
  const reservations = storage.getReservations();
  const vouchers = storage.getVouchers();
  const reviews = storage.getReviews();
  const cities = storage.getCities();
  const banners = storage.getBanners();
  const auditLogs = storage.getAuditLogs();
  const settings = storage.getSettings();
  const users = storage.getUsers();
  const currentUser = storage.getCurrentUser();

  // Navigation & Filtering
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [selectedCity, setSelectedCity] = useState<string>('all');

  // Modals state
  const [selectedDealForReservation, setSelectedDealForReservation] = useState<FoodDeal | null>(null);
  const [activeVoucherModal, setActiveVoucherModal] = useState<Voucher | null>(null);
  const [storeRegisterModalOpen, setStoreRegisterModalOpen] = useState<boolean>(false);
  const [setupGuideModalOpen, setSetupGuideModalOpen] = useState<boolean>(false);

  // Default active merchant store for Merchant Portal
  const activeMerchantStore: Store = stores.find(s => s.status === 'approved') || stores[0];

  // Reservation Handlers
  const handleOpenReservation = (deal: FoodDeal) => {
    setSelectedDealForReservation(deal);
  };

  const handleConfirmReservation = (data: {
    dealId: string;
    quantity: number;
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    notes?: string;
  }) => {
    return storage.createReservation(data);
  };

  const handleReservationSuccess = (res: Reservation, voucher: Voucher) => {
    setSelectedDealForReservation(null);
    setActiveVoucherModal(voucher);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-16 md:pb-0">
      
      {/* Primary Top Bar Navigation */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        selectedCity={selectedCity}
        setSelectedCity={setSelectedCity}
        cities={cities}
        currentRole={currentUser.role}
        onSwitchRole={(role: UserRole) => {
          storage.switchRole(role);
          if (role === 'admin') setCurrentTab('admin');
          else if (role === 'merchant') setCurrentTab('merchant');
          else setCurrentTab('marketplace');
        }}
        onOpenStoreRegister={() => setStoreRegisterModalOpen(true)}
        onOpenSetupGuide={() => setSetupGuideModalOpen(true)}
        onOpenAuthModal={() => {}}
      />

      {/* Main Content Router */}
      <div className="flex-1">
        
        {/* Tab: HOME */}
        {currentTab === 'home' && (
          <div>
            <Hero
              onExploreFood={() => setCurrentTab('marketplace')}
              onRegisterStore={() => setStoreRegisterModalOpen(true)}
              stats={stats}
            />

            <Marketplace
              deals={deals}
              categories={categories}
              cities={cities}
              selectedCity={selectedCity}
              setSelectedCity={setSelectedCity}
              onReserve={handleOpenReservation}
            />

            <ImpactDashboard
              stats={stats}
              reviews={reviews}
              onExploreFood={() => setCurrentTab('marketplace')}
            />
          </div>
        )}

        {/* Tab: ALL FOOD MARKETPLACE */}
        {currentTab === 'marketplace' && (
          <Marketplace
            deals={deals}
            categories={categories}
            cities={cities}
            selectedCity={selectedCity}
            setSelectedCity={setSelectedCity}
            onReserve={handleOpenReservation}
          />
        )}

        {/* Tab: CUSTOMER VOUCHERS */}
        {currentTab === 'vouchers' && (
          <MyVouchers
            vouchers={vouchers}
            reservations={reservations}
            onViewVoucherModal={(v) => setActiveVoucherModal(v)}
          />
        )}

        {/* Tab: IMPACT DASHBOARD */}
        {currentTab === 'impact' && (
          <ImpactDashboard
            stats={stats}
            reviews={reviews}
            onExploreFood={() => setCurrentTab('marketplace')}
          />
        )}

        {/* Tab: STORE OWNER / MERCHANT DASHBOARD */}
        {currentTab === 'merchant' && (
          <MerchantDashboard
            currentStore={activeMerchantStore}
            deals={deals}
            reservations={reservations}
            categories={categories}
            cities={cities}
            onAddDeal={(d) => storage.addDeal(d)}
            onUpdateDeal={(id, updates) => storage.updateDeal(id, updates)}
            onDeleteDeal={(id) => storage.deleteDeal(id)}
            onConfirmCashCollection={(orderNum, merchantName) =>
              storage.confirmMerchantCashCollection(orderNum, merchantName)
            }
          />
        )}

        {/* Tab: ADMIN DASHBOARD (COMPLETE APP CONTROL) */}
        {currentTab === 'admin' && (
          <AdminDashboard
            stats={stats}
            users={users}
            stores={stores}
            deals={deals}
            categories={categories}
            reservations={reservations}
            vouchers={vouchers}
            reviews={reviews}
            cities={cities}
            banners={banners}
            auditLogs={auditLogs}
            settings={settings}
            onUpdateStore={(id, u) => storage.updateStore(id, u)}
            onDeleteStore={(id) => storage.deleteStore(id)}
            onAddStore={(s) => storage.addStore(s)}
            onUpdateDeal={(id, u) => storage.updateDeal(id, u)}
            onDeleteDeal={(id) => storage.deleteDeal(id)}
            onAddDeal={(d) => storage.addDeal(d)}
            onUpdateCategory={(id, u) => storage.updateCategory(id, u)}
            onDeleteCategory={(id) => storage.deleteCategory(id)}
            onAddCategory={(c) => storage.addCategory(c)}
            onUpdateUser={(id, u) => storage.updateUser(id, u)}
            onDeleteUser={(id) => storage.deleteUser(id)}
            onAddUser={(u) => storage.addUser(u)}
            onUpdateReservation={(id, u) => storage.updateReservation(id, u)}
            onRevokeVoucher={(id) => storage.revokeVoucher(id)}
            onUpdateReviewStatus={(id, s) => storage.updateReviewStatus(id, s)}
            onDeleteReview={(id) => storage.deleteReview(id)}
            onUpdateCity={(id, u) => storage.updateCity(id, u)}
            onAddCity={(c) => storage.addCity(c)}
            onDeleteCity={(id) => storage.deleteCity(id)}
            onUpdateBanner={(id, u) => storage.updateBanner(id, u)}
            onAddBanner={(b) => storage.addBanner(b)}
            onDeleteBanner={(id) => storage.deleteBanner(id)}
            onUpdateSettings={(s) => storage.updateSettings(s)}
            onLogout={() => {
              storage.switchRole('customer');
              setCurrentTab('home');
            }}
          />
        )}

      </div>

      {/* Footer */}
      <Footer
        settings={settings}
        onNavigate={(tab) => setCurrentTab(tab)}
        onOpenStoreRegister={() => setStoreRegisterModalOpen(true)}
        onOpenSetupGuide={() => setSetupGuideModalOpen(true)}
      />

      {/* Mobile Bottom Navigation */}
      <BottomNav
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        currentRole={currentUser.role}
        voucherCount={vouchers.filter(v => !v.is_redeemed).length}
      />

      {/* Modals */}
      <ReservationModal
        deal={selectedDealForReservation}
        onClose={() => setSelectedDealForReservation(null)}
        onConfirmReservation={handleConfirmReservation}
        onSuccess={handleReservationSuccess}
      />

      <VoucherModal
        voucher={activeVoucherModal}
        onClose={() => setActiveVoucherModal(null)}
      />

      <StoreRegisterModal
        isOpen={storeRegisterModalOpen}
        onClose={() => setStoreRegisterModalOpen(false)}
        cities={cities}
        onRegisterStore={(s) => storage.addStore(s)}
      />

      <SetupGuideModal
        isOpen={setupGuideModalOpen}
        onClose={() => setSetupGuideModalOpen(false)}
      />

    </div>
  );
}
